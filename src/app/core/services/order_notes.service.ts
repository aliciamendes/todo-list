export const sortingNotes = (arr: any[], order = 'asc') => {
  return arr.sort((a, b) => {
    const descA = a.description.toLowerCase();
    const descB = b.description.toLowerCase();

    if (order === 'asc') {
      return descA.localeCompare(descB); // Ordem ascendente
    } else {
      return descB.localeCompare(descA); // Ordem descendente
    }
  });
};
