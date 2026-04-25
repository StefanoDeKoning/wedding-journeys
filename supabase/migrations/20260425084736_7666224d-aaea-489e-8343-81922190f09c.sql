ALTER TABLE public.weddings
ADD COLUMN IF NOT EXISTS invitation_text TEXT NOT NULL DEFAULT
'Dear {FirstName} {LastName},

You are warmly invited to the most magical celebration of the year.

The location and all details can be found on the reverse side of this letter.

Please return this letter with any dietary wishes or special requests.

With love,
The happy couple.';