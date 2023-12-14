const textFieldGen = (field: string) => {
  if (field === 'username') return { type: 'text' };
  if (field === 'email') return { type: 'email' };
  if (field === 'phone') return { type: 'text' };
  return { type: 'password' };
};

export default textFieldGen;
