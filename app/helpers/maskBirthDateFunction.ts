export default function maskBirthDateFunction(value: string) {
  const cleanedValue = value.replace(/\D/g, '');

  const maskedValue = cleanedValue
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
    .slice(0, 10);

  return maskedValue;
}
