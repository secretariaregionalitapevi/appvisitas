import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def confirmar_email_usuario(user_id):
    """
    Confirma o e-mail de um usuário no Supabase usando a Service Role Key.
    """
    try:
        response = supabase.auth.admin.update_user_by_id(
            user_id,
            {"email_confirm": True}
        )
        return response
    except Exception as e:
        print(f"Erro ao confirmar usuário: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python scripts/confirma_usuario.py <USER_ID>")
        print("Exemplo: python scripts/confirma_usuario.py 123e4567-e89b-12d3-a456-426614174000")
        sys.exit(1)

    user_id = sys.argv[1]
    print(f"Confirmando usuário: {user_id}...")
    
    res = confirmar_email_usuario(user_id)
    
    if res:
        print("Sucesso! Usuário confirmado.")
        print(res)
    else:
        print("Falha ao confirmar o usuário. Verifique se o ID está correto.")
