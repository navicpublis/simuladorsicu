export const VALIDATION_DURATION_MS = 3000;
export const PROCESSING_DURATION_MS = 4000;
export const DOCUMENTATION_FEE = 48.7;
export const SUGGESTED_CREDIT = 12000;
export const INSTALLMENT_OPTIONS = [6, 12, 24, 36, 48, 60] as const;
export const questions = [
  { title: 'Qual é a sua faixa etária?', hint: 'Vamos conhecer um pouco mais sobre você.', options: ['18 a 25 anos', '26 a 35 anos', '36 a 45 anos', '46 anos ou mais'] },
  { title: 'Em qual região do Brasil você reside?', hint: 'Isso nos ajuda a aplicar as taxas regionais.', options: ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'] },
  { title: 'Qual o seu estado civil?', hint: 'Informação necessária para análise de composição familiar.', options: ['Solteiro(a)', 'Casado(a) / União Estável', 'Divorciado(a)', 'Viúvo(a)'] },
  { title: 'Qual o seu nível de escolaridade?', hint: 'A formação acadêmica influencia o score de crédito.', options: ['Ensino Médio', 'Técnico', 'Graduação', 'Pós-graduação / Mestrado / Doutorado'] },
  { title: 'Você possui filhos?', hint: 'Cada perfil tem suas próprias necessidades.', options: ['Sim, possuo filhos', 'Não possuo filhos'] },
  { title: 'Qual é a sua ocupação atual?', hint: 'Conte como você trabalha hoje.', options: ['Assalariado(a)', 'Autônomo(a)', 'Aposentado(a)', 'Estou buscando uma oportunidade'] },
  { title: 'Há quanto tempo está no emprego atual?', hint: 'A estabilidade profissional é um ponto chave.', options: ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos'] },
  { title: 'Qual o seu tipo de residência?', hint: 'Ajuda a entender sua estabilidade domiciliar.', options: ['Casa própria', 'Aluguel', 'Cedida / Familiar'] },
  { title: 'Qual é o objetivo do crédito?', hint: 'O próximo passo começa com seus planos.', options: ['Organizar minhas finanças', 'Investir em um projeto', 'Resolver uma emergência'] },
  { title: 'Qual é a sua renda mensal?', hint: 'Esta é a última pergunta da simulação.', options: ['Até R$ 1.500', 'R$ 1.501 a R$ 3.000', 'R$ 3.001 a R$ 5.000', 'Acima de R$ 5.000'] },
];
export function installmentAmount(months: number) { return SUGGESTED_CREDIT / months; }
export function currency(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
export function formatDocument(value: string) {
  return value.replace(/\D/g, '').slice(0, 11).replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}
