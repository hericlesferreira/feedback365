import crypto from "node:crypto";

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const calcDigit = (factor: number) => {
    let total = 0;
    for (let index = 0; index < factor - 1; index += 1) {
      total += Number(cpf[index]) * (factor - index);
    }
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(10) === Number(cpf[9]) && calcDigit(11) === Number(cpf[10]);
}

export function hashCpf(value: string) {
  const secret = process.env.CPF_HASH_SECRET;

  if (!secret) {
    throw new Error("CPF_HASH_SECRET is not configured.");
  }

  return crypto.createHmac("sha256", secret).update(onlyDigits(value)).digest("hex");
}

export function maskCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return value;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
