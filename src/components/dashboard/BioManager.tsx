import { useEffect, useState } from 'react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, User } from 'lucide-react';

export const BioManager = () => {
  const { bio, saveBio, loading } = useSiteContent();
  const [headline, setHeadline] = useState('');
  const [paragraphsRaw, setParagraphsRaw] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    if (bio) {
      setHeadline(bio.headline);
      setParagraphsRaw(bio.paragraphs.join('\n\n'));
      setLocation(bio.location);
      setAvailability(bio.availability);
    }
  }, [bio]);

  const handleSave = async () => {
    await saveBio({
      headline,
      paragraphs: paragraphsRaw.split('\n\n').map(p => p.trim()).filter(Boolean),
      location,
      availability,
    });
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><User className="w-5 h-5 text-primary" />Bio / About</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage the About page content</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Headline</label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Paragraphs (separate with blank line)</label>
          <Textarea rows={10} value={paragraphsRaw} onChange={(e) => setParagraphsRaw(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Availability</label>
            <Input value={availability} onChange={(e) => setAvailability(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleSave} className="bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-2" />Save Bio</Button>
      </div>
    </div>
  );
};
