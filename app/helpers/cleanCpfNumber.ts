export default function cleanCpfNumber(cpf: string) {
  const newCpf = cpf.replace(/[.-]/g, '');
  return newCpf;
}
