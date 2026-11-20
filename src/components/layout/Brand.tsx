import Image from "next/image";
import styles from "./site-shell.module.css";

export function Brand() {
  return (
    <span className={styles.brand}>
      <Image className={styles.mark} src="/favicon-48x48.png" width={36} height={36} alt="" unoptimized />
      <span>The Teff Papers</span>
    </span>
  );
}
