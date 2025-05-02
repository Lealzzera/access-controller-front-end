export default function maskCpfFunction(value: string) {
  value = value.replace(/\D/g, '');

  value = value.substring(0, 11);

  if (value.length > 9) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (value.length > 6) {
    return value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else if (value.length > 3) {
    return value.replace(/(\d{3})(\d+)/, '$1.$2');
  } else {
    return value;
  }
}
