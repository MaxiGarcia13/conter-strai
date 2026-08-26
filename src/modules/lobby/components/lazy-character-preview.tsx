import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

const CharacterPreview = lazy(() => import('./character-preview').then((module) => ({ default: module.CharacterPreview })));

export function LazyCharacterPreview(props: ComponentProps<typeof CharacterPreview>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CharacterPreview {...props} />
    </Suspense>
  );
}
