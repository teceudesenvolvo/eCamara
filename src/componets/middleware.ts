import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define seus hostnames de tenant e seus slugs correspondentes.
// Em uma aplicação real, este mapeamento pode vir de um banco de dados ou variáveis de ambiente.
const TENANT_HOSTNAMES: { [key: string]: string } = {
  'dominio-a.com': 'venda1',
  'www.dominio-a.com': 'venda1',
  'dominio-b.com.br': 'venda2',
  'www.dominio-b.com.br': 'venda2',
  // Adicione mais mapeamentos de tenants aqui.
  // Exemplo para um domínio padrão (se você tiver um):
  // 'seu-app-principal.com': 'default',
  // 'www.seu-app-principal.com': 'default',
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host');

  // Verifica se o hostname está mapeado para um tenant específico.
  if (hostname && TENANT_HOSTNAMES[hostname]) {
    const tenantSlug = TENANT_HOSTNAMES[hostname];

    // Constrói o novo pathname da URL para reescrita.
    // Isso adiciona o slug do tenant ao início do caminho original.
    // Por exemplo:
    // - Requisição para 'dominio-a.com/' reescreve para '/sites/venda1/'
    // - Requisição para 'dominio-a.com/produtos' reescreve para '/sites/venda1/produtos'
    url.pathname = `/sites/${tenantSlug}${url.pathname}`;

    return NextResponse.rewrite(url);
  }

  // Se o hostname não corresponder a nenhum tenant,
  // ou se for o domínio principal da aplicação,
  // permite que a requisição prossiga para o roteamento padrão.
  return NextResponse.next();
}

// Configuração para o middleware.
// A propriedade `matcher` especifica em quais caminhos o middleware deve ser executado.
// É crucial excluir assets estáticos e caminhos internos do Next.js para evitar problemas.
export const config = {
  matcher: [
    // Corresponde a todos os caminhos de requisição, exceto aqueles que começam com:
    // - /api (rotas de API)
    // - /_next/static (arquivos estáticos do Next.js)
    // - /_next/image (arquivos de otimização de imagem do Next.js)
    // - /favicon.ico (arquivo favicon)
    // - Qualquer arquivo com uma extensão (ex: .jpg, .png, .css, .js)
    // Isso garante que o middleware processe apenas requisições de páginas reais.
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};