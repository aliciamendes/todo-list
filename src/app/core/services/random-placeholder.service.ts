const list_placeholders = [
  'Go grocery shopping',
  'Call the dentist',
  'Finish reading the book',
  'Exercise at the gym',
  'Buy new shoes',
  'Plan the weekend trip',
  'Water the plants',
  'Organize my workspace',
  'Send a gift to mom',
  'Research for the project',
  'Prepare dinner for friends',
  'Watch the new movie',
  'Schedule a haircut',
  'Backup my computer files',
];

export const generatePlaceholder = () => {
  const index = Math.floor(Math.random() * list_placeholders.length);
  return list_placeholders[index];
};
