import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def check_users():
    # List all users in Auth
    res = supabase.auth.admin.list_users()
    print("USUÁRIOS NO AUTH:")
    for user in res:
        print(f"Email: {user.email} | ID: {user.id} | Metadata: {user.user_metadata}")
    
    # Check rjm_auxiliares
    print("\nTABELA rjm_auxiliares:")
    res_db = supabase.table("rjm_auxiliares").select("*").execute()
    for row in res_db.data:
        print(row)

if __name__ == "__main__":
    check_users()
