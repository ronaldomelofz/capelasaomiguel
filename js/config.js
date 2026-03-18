// ============================================================
//  CONFIGURAÇÃO DO FIREBASE
//  Substitua os valores abaixo pelas credenciais do seu projeto
//  Firebase Console → Configurações do projeto → Seus apps → Web
// ============================================================

export const FIREBASE_CONFIG = {
  "apiKey": "SUA_API_KEY_AQUI",
  "authDomain": "SEU_PROJECT_ID.firebaseapp.com",
  "projectId": "SEU_PROJECT_ID",
  "storageBucket": "SEU_PROJECT_ID.appspot.com",
  "messagingSenderId": "SEU_MESSAGING_SENDER_ID",
  "appId": "SEU_APP_ID"
};

// ============================================================
//  USUÁRIO ADMINISTRADOR PADRÃO
//  Criar no Firebase Console: Authentication > Users > Add user
//  E-mail: admin@capelasaomiguel.com | Senha: admin
// ============================================================
export const ADMIN_DEFAULT = {
  "email": "admin@capelasaomiguel.com",
  "usernames": [
    "admin",
    "administrador"
  ]
};

// ============================================================
//  CATEGORIAS DE RECEITAS
// ============================================================
export const CATEGORIAS_RECEITA = [
  "Dízimo",
  "Oferta do Domingo",
  "Oferta Especial",
  "Doação",
  "Venda de Artigos Religiosos",
  "Aluguel de Espaços",
  "Eventos e Quermesse",
  "Cânon Diocesano",
  "Outras Receitas"
];

// ============================================================
//  CATEGORIAS DE DESPESAS
// ============================================================
export const CATEGORIAS_DESPESA = [
  "Manutenção Predial",
  "Água e Esgoto",
  "Energia Elétrica",
  "Internet e Telefone",
  "Material de Limpeza",
  "Material de Escritório",
  "Salários e Encargos",
  "Liturgia e Sacramentos",
  "Obras e Reformas",
  "Pagamento ao Bispado",
  "Alimentação",
  "Transporte",
  "Seguros",
  "Impostos e Taxas",
  "Doações a Terceiros",
  "Outras Despesas"
];

// ============================================================
//  PERFIS DE ACESSO
// ============================================================
export const PERFIS = {
  ADMIN: "admin",
  VISUALIZADOR: "visualizador"
};
