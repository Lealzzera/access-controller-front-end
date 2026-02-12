export default function cleanPhoneNumber(phone: string) {
  return phone.replace(/\D/g, '');
}
