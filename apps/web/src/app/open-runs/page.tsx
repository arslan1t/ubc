import { redirect } from 'next/navigation';

// Canonical route is /pickup-games — keep old links working.
export default function OpenRunsRedirect() {
  redirect('/pickup-games');
}
