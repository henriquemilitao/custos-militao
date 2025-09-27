function formatarName(texto: string) {
  return texto
    .toLowerCase() // deixa tudo minúsculo
    .split(" ") // separa pelas palavras
    .filter(Boolean) // remove espaços extras
    .map(
      (palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1) // 1ª maiúscula
    )
    .join(" "); // junta de volta
}