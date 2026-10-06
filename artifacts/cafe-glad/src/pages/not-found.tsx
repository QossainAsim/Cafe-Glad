import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <main lang="da" className="min-h-screen w-full flex items-center justify-center bg-[#f7f0e7] px-4">
      <Card className="w-full max-w-md mx-4 border-[#e7d8c9] bg-[#fffaf3]">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[#d9683b]" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-[#30251f]">
              Siden blev ikke fundet
            </h1>
          </div>

          <p className="mt-4 text-sm text-[#665950]">
            Den adresse findes ikke. Gå tilbage til forsiden, eller ring til os på{' '}
            <a className="underline underline-offset-4" href="tel:+4561427733">
              +45 61 42 77 33
            </a>
            .
          </p>
          <a className="mt-5 inline-block text-sm font-semibold text-[#a34828] underline underline-offset-4" href="/">
            Til forsiden
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
