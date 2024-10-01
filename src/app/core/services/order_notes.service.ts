export const sortingNotes = (notes: any[], order = 'asc') => {
  return notes.sort((a, b) => {
    const descA = a.description.toLowerCase();
    const descB = b.description.toLowerCase();

    const doneAndPinned = a.done === false && a.isPinned == false;

    if (order === 'asc' && doneAndPinned) {
      return descA.localeCompare(descB);
    } else if (order === 'desc' && doneAndPinned) {
      return descB.localeCompare(descA);
    }
  });
};
