export default function maskPhoneFunction(value: string) {
  value = value.replace(/\D/g, '');

  value = value.substring(0, 11);

  if (value.length > 6) {
    return value.replace(/(\d{2})(\d{5})(\d+)/, '($1)$2-$3');
  } else if (value.length > 2) {
    return value.replace(/(\d{2})(\d+)/, '($1)$2');
  } else {
    return value;
  }
}
