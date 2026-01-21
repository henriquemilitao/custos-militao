import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Authentication = async () => {
  const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (session?.user) {
      return redirect("/");
    }
  
  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-neutral-100 pt-4 sm:pt-20">
      
      {/* Container "Celular" */}
      <div className="w-full max-w-md bg-white h-fit min-h-[500px] sm:rounded-2xl sm:shadow-xl overflow-hidden pb-10">
        
        <div className="flex flex-col gap-6 p-5">
          <Tabs defaultValue="sign-in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Entrar</TabsTrigger>
              <TabsTrigger value="sign-up">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in" className="w-full mt-6">
              <SignInForm />
            </TabsContent>
            <TabsContent value="sign-up" className="w-full mt-6">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
};

export default Authentication;
