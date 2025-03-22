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
