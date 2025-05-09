//Funciones para entidades de Oposiciones y Bloques
function isTemaNombreUnico(nombre) {
  const temasSheet = getGoogleSheet('Temas');
  const temasColumns = getColumnIndices('Temas');
  const temasData = temasSheet.getDataRange().getValues();
  temasData.shift(); // Eliminar encabezados

  return !temasData.some(row => String(row[temasColumns['nombre']]).toLowerCase() === nombre.toLowerCase());
}

function getTemasEnArbol() {
  const temasSheet = getGoogleSheet('Temas');
  const temasColumns = getColumnIndices('Temas');
  const temasData = temasSheet.getDataRange().getValues();
  temasData.shift(); // Eliminar encabezados

  // Crear un mapa para almacenar los temas por ID
  const temasMap = new Map();
  temasData.forEach(row => {
    const idTema = row[temasColumns['id_tema']];
    const idPadre = row[temasColumns['id_padre']];
    const nivel = row[temasColumns['nivel']];
    const prenombre = row[temasColumns['prenombre']];
    const nombre = row[temasColumns['nombre']];

    temasMap.set(idTema, { id: idTema, idPadre, nivel, prenombre, nombre, hijos: [] });
  });

  // Construir la estructura jerárquica
  const temasRaiz = [];
  temasMap.forEach(tema => {
    if (tema.idPadre) {
      const padre = temasMap.get(tema.idPadre);
      if (padre) {
        padre.hijos.push(tema);
      }
    } else {
      temasRaiz.push(tema);
    }
  });

  // Ordenar recursivamente los temas
  function ordenarTemas(temas) {
    return temas
      .sort((a, b) => {
        if (a.nivel === b.nivel) {
          return a.prenombre.localeCompare(b.prenombre) || a.nombre.localeCompare(b.nombre);
        }
        return a.nivel - b.nivel;
      })
      .map(tema => ({ ...tema, hijos: ordenarTemas(tema.hijos) }));
  }

  return ordenarTemas(temasRaiz);
}

function getTemasEnArbolOrdenados() {
  const temasSheet = getGoogleSheet('Temas');
  const temasColumns = getColumnIndices('Temas');
  const temasData = temasSheet.getDataRange().getValues();
  temasData.shift(); // Eliminar encabezados

  // Crear un mapa para almacenar los temas por ID
  const temasMap = new Map();
  temasData.forEach(row => {
    const idTema = row[temasColumns['id_tema']];
    const idPadre = row[temasColumns['id_padre']];
    const nivel = row[temasColumns['nivel']];
    const prenombre = row[temasColumns['prenombre']] || '';
    const nombre = row[temasColumns['nombre']];

    temasMap.set(idTema, { id: idTema, idPadre, nivel, prenombre, nombre, hijos: [] });
  });

  // Construir la estructura jerárquica
  const temasRaiz = [];
  temasMap.forEach(tema => {
    if (tema.idPadre) {
      const padre = temasMap.get(tema.idPadre);
      if (padre) {
        padre.hijos.push(tema);
      }
    } else {
      temasRaiz.push(tema);
    }
  });

  // Ordenar recursivamente los temas por nivel y prenombre
  function ordenarTemas(temas) {
    return temas
      .sort((a, b) => a.prenombre.localeCompare(b.prenombre) || a.nombre.localeCompare(b.nombre))
      .map(tema => ({
        ...tema,
        hijos: ordenarTemas(tema.hijos)
      }));
  }

  return ordenarTemas(temasRaiz);
}
//****************************************************
//FIN Funciones para entidades de Oposiciones y Bloques


/**
 * Devuelve todos los temas con sus campos.
 */
function getTemas() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Temas");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const temas = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return {
      id: obj.id_tema,
      nombre: obj.nombre,
      nombre_completo: obj.nombre_completo,
      prenombre: obj.prenombre,
      id_padre: obj.id_padre,
      id_bloque: obj.id_bloque,
      pag_desde: obj.pag_desde,
      pag_hasta: obj.pag_hasta,
      maquetado: obj.maquetado === true || obj.maquetado === "TRUE"
    };
  });
  return temas;
}

/**
 * Añade un nuevo tema a la hoja.
 */
function addTema(nombre, nombreCompleto, prenombre, idPadre, idBloque, pagDesde, pagHasta, maquetado) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Temas");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const lastId = Math.max(...data.slice(1).map(r => Number(r[0]) || 0));
  const nivel = calcularNivel(idPadre, data, headers);

  const fila = [];
  fila[headers.indexOf("id_tema")] = lastId + 1;
  fila[headers.indexOf("nombre")] = nombre;
  fila[headers.indexOf("nombre_completo")] = nombreCompleto;
  fila[headers.indexOf("prenombre")] = prenombre;
  fila[headers.indexOf("nivel")] = nivel;
  fila[headers.indexOf("id_padre")] = idPadre;
  fila[headers.indexOf("id_bloque")] = idBloque;
  fila[headers.indexOf("pag_desde")] = pagDesde;
  fila[headers.indexOf("pag_hasta")] = pagHasta;
  fila[headers.indexOf("maquetado")] = maquetado;

  sheet.appendRow(fila);
}

function calcularNivel(idPadre, data, headers) {
  if (!idPadre) return 1;
  const filaPadre = data.find(r => String(r[0]) === String(idPadre));
  return filaPadre ? Number(filaPadre[headers.indexOf("nivel")]) + 1 : 1;
}

/**
 * Actualiza los datos de un tema existente.
 */
function updateTema(idTema, nombre, nombreCompleto, prenombre, idBloque, pagDesde, pagHasta, maquetado) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Temas");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(idTema)) {
      data[i][headers.indexOf("nombre")] = nombre;
      data[i][headers.indexOf("nombre_completo")] = nombreCompleto;
      data[i][headers.indexOf("prenombre")] = prenombre;
      data[i][headers.indexOf("id_bloque")] = idBloque;
      data[i][headers.indexOf("pag_desde")] = pagDesde;
      data[i][headers.indexOf("pag_hasta")] = pagHasta;
      data[i][headers.indexOf("maquetado")] = maquetado;
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      return;
    }
  }
}

/**
 * Elimina un tema si no tiene subtemas.
 */
function deleteTema(idTema) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Temas");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const tieneHijos = data.some(r => String(r[headers.indexOf("id_padre")]) === String(idTema));
  if (tieneHijos) throw new Error("No se puede eliminar un tema con subtemas.");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(idTema)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}


