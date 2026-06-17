import { redirect } from 'next/navigation';
import { InteractiveHome } from '@/components/InteractiveHome';

export default async function Home() {
  const session: any = { user: null }; // Mocked session

  if (session?.user) {
    redirect('/chat');
  }

  return <InteractiveHome />;
}
