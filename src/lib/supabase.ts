import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gojtjabdfseugvayffhm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvanRqYWJkZnNldWd2YXlmZmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzQyNTAsImV4cCI6MjEwMTY1MDI1MH0.gLU_EdKzyqfta-oBpJqvXFgYMXusx7sCuwcQPwAysfg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

