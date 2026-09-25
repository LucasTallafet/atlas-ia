"""Lectura y validación de una ficha fichas/<id>.md. Sin dependencias externas."""
import json
import re

SECCIONES = ['En una frase', 'Intuición', 'Explicación', 'Formalización', 'Interactivo',
             'En código', 'Errores típicos', 'En resumen', 'A fondo', 'Autoevaluación', 'Glosario']
OBLIGATORIAS = {'En una frase', 'Intuición', 'Explicación', 'Formalización', 'Errores típicos',
                'En resumen', 'Autoevaluación', 'Glosario'}
CUERPO = ('Explicación', 'Formalización', 'A fondo')  # cuentan para objetivo_palabras
PROHIBIDO = re.compile(r'\b(TODO|XXX|FIXME)\b|(?i:lorem ipsum)|<!--')  # en mayúsculas: 'todo' en español es válido
BLOQUE_CODIGO = re.compile(r'^```([\w-]*)[^\n]*\n(.*?)^```\s*$', re.S | re.M)


def leer(ruta):
    raw = ruta.read_text(encoding='utf-8').replace('\r\n', '\n')
    meta, cuerpo = {}, raw
    m = re.match(r'^---\n(.*?)\n---\n', raw, re.S)
    if m:
        for ln in m.group(1).split('\n'):
            if ':' in ln:
                k, v = ln.split(':', 1)
                meta[k.strip()] = v.strip()
        cuerpo = raw[m.end():]
    secciones, orden, actual, buf, en_codigo = {}, [], None, [], False
    for ln in cuerpo.split('\n'):
        if ln.strip().startswith('```'):
            en_codigo = not en_codigo
        if not en_codigo and ln.startswith('## '):
            if actual is not None:
                secciones[actual] = '\n'.join(buf).strip()
            actual, buf = ln[3:].strip(), []
            orden.append(actual)
        elif actual is not None:
            buf.append(ln)
        elif ln.strip() and not ln.startswith('# '):
            orden.append('__texto_suelto__')
    if actual is not None:
        secciones[actual] = '\n'.join(buf).strip()
    return meta, secciones, orden


def sin_codigo_ni_mates(s):
    s = BLOQUE_CODIGO.sub(' ', s)
    s = re.sub(r'\$\$.*?\$\$', ' formula ', s, flags=re.S)
    return re.sub(r'\$[^$\n]+\$', ' x ', s)


def contar(s):
    return len(sin_codigo_ni_mates(s).split())


def parse_widget(bloque):
    """Bloque ```widget: líneas 'clave: valor' (valor JSON, admite varias líneas).
    El motor 'pasos' usa fotogramas en Markdown separados por líneas '---' tras la cabecera."""
    lineas = bloque.split('\n')
    params, clave, partes, fotogramas = {}, None, [], None
    for i, ln in enumerate(lineas):
        if ln.strip() == '---':
            fotogramas = '\n'.join(lineas[i + 1:])
            break
        m = re.match(r'^([a-z_][\w-]*):\s?(.*)$', ln)
        if m:
            if clave:
                params[clave] = '\n'.join(partes).strip()
            clave, partes = m.group(1), [m.group(2)]
        elif clave:
            partes.append(ln)
    if clave:
        params[clave] = '\n'.join(partes).strip()
    out, errores = {}, []
    for k, v in params.items():
        if v == '':
            errores.append(f'widget: "{k}" sin valor')
            continue
        v_json = re.sub(r'\\(?!")', r'\\\\', v)  # LaTeX con una sola barra
        try:
            out[k] = json.loads(v_json)
        except json.JSONDecodeError:
            if re.fullmatch(r'[\w.\-áéíóúñ ]+', v):
                out[k] = v.strip()
            else:
                errores.append(f'widget: valor de "{k}" no es JSON válido: {v[:60]}')
    if fotogramas is not None:
        fr = [f.strip() for f in re.split(r'^---\s*$', fotogramas, flags=re.M) if f.strip()]
        out['fotogramas'] = [{'texto': f} for f in fr]
    return out, errores


def parse_quiz(s):
    preguntas, errores = [], []
    bloques = re.split(r'^### ', s, flags=re.M)
    if bloques and bloques[0].strip():
        errores.append('Autoevaluación: texto antes de la primera pregunta "### "')
    for b in bloques[1:]:
        lineas = b.split('\n')
        enunciado = lineas[0].strip()
        opciones, explicacion, extra = [], [], []
        for ln in lineas[1:]:
            m = re.match(r'^- \[( |x|X)\] (.+)$', ln)
            if m:
                opciones.append({'texto': m.group(2).strip(), 'correcta': m.group(1).lower() == 'x'})
            elif ln.startswith('>'):
                explicacion.append(ln.lstrip('> ').rstrip())
            elif ln.strip():
                extra.append(ln)
        if extra:
            enunciado += '\n' + '\n'.join(extra)
        n_ok = sum(o['correcta'] for o in opciones)
        if len(opciones) < 3:
            errores.append(f'Pregunta "{enunciado[:40]}": necesita ≥3 opciones')
        if n_ok != 1:
            errores.append(f'Pregunta "{enunciado[:40]}": debe tener exactamente 1 opción [x] (tiene {n_ok})')
        if not explicacion:
            errores.append(f'Pregunta "{enunciado[:40]}": falta la explicación "> Por qué: ..."')
        preguntas.append({'enunciado': enunciado, 'opciones': opciones, 'explicacion': ' '.join(explicacion)})
    if not 3 <= len(preguntas) <= 6:
        errores.append(f'Autoevaluación: {len(preguntas)} preguntas (deben ser 3-6)')
    return preguntas, errores


def parse_glosario(s):
    terminos, errores = [], []
    for ln in s.split('\n'):
        if not ln.strip():
            continue
        m = re.match(r'^- \*\*(.+?)\*\*(?:\s*\([^)]*\))?:\s*(.+)$', ln)
        if not m:
            errores.append(f'Glosario: línea con formato incorrecto: "{ln[:50]}" (usa "- **término**: definición")')
            continue
        if len(m.group(2).split()) > 30:
            errores.append(f'Glosario: definición de "{m.group(1)}" supera 30 palabras')
        terminos.append({'termino': m.group(1).strip(), 'definicion': m.group(2).strip()})
    if not terminos:
        errores.append('Glosario: vacío')
    return terminos, errores


def comprobar_mates(nombre, s):
    errs = []
    t = BLOQUE_CODIGO.sub('', s)
    if t.count('$$') % 2:
        errs.append(f'{nombre}: "$$" desemparejado')
    t2 = re.sub(r'\$\$.*?\$\$', '', t, flags=re.S)
    for par in re.split(r'\n\s*\n', t2):
        if len(re.findall(r'(?<!\\)\$', par)) % 2:
            errs.append(f'{nombre}: "$" desemparejado en: "{par.strip()[:60]}…"')
    if t.count('\\(') or t.count('\\['):
        errs.append(f'{nombre}: usa $…$ y $$…$$, no \\( \\) ni \\[ \\]')
    return errs
