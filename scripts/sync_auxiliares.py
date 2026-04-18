import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def sync():
    # 1. Obter todos os usuários do Auth
    print("Buscando usuários do Auth...")
    res = supabase.auth.admin.list_users()
    
    # 2. Inserir na tabela rjm_auxiliares
    print(f"Encontrados {len(res)} usuários. Sincronizando...")
    
    for user in res:
        full_name = user.user_metadata.get("full_name")
        comum = user.user_metadata.get("comum")
        
        # Tenta extrair do email se não tiver nome
        if not full_name:
            full_name = user.email.split('@')[0].capitalize()
        
        data = {
            "id": user.id,
            "full_name": full_name,
            "email": user.email,
            "comum": comum,
            "cidade": "Itapevi"
        }
        
        try:
            # Upsert para não duplicar se já existir (mesmo vindo do zero agora)
            res_upsert = supabase.table("rjm_auxiliares").upsert(data).execute()
            print(f"Sincronizado: {user.email} -> {full_name}")
        except Exception as e:
            print(f"Erro ao sincronizar {user.email}: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    sync()
