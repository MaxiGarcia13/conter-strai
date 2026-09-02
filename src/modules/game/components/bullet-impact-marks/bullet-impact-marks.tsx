import { useBulletImpactStore } from '@/modules/game/stores/bullet-impact-store';
import { ImpactMark } from './impact-mark';

/** Cosmetically renders recent bullet-hole marks from the impact store. */
export function BulletImpactMarks() {
  const impacts = useBulletImpactStore((state) => state.impacts);

  return (
    <group>
      {impacts.map((impact) => (
        <ImpactMark key={impact.id} impact={impact} />
      ))}
    </group>
  );
}
