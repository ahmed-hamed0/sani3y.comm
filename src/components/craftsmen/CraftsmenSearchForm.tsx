
import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CraftsmenSearchFormProps {
  onSearch: (term: string) => void;
}

export function CraftsmenSearchForm({ onSearch }: CraftsmenSearchFormProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="ابحث عن صنايعي..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
