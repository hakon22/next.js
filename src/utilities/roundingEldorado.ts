const roundingEldorado = (number: number) => {
  const roundedNumber = Math.floor(number);

  if (roundedNumber % 10 === 0) {
    return roundedNumber - 1;
  }

  if (roundedNumber < 100 && roundedNumber % 10 !== 9) {
    return Math.floor(roundedNumber / 10) * 10 + 4;
  }

  if (roundedNumber % 10 !== 9) {
    return Math.floor(roundedNumber / 10) * 10 + 9;
  }

  return roundedNumber;
};

export default roundingEldorado;
