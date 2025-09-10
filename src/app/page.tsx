import StyleCard from "@/components/Stylecard";
import MetalCard from "@/components/Metal";   
import styles from "./page.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      {/* Left side */}
      <aside className={styles.leftPanel}>
        <StyleCard price={1000} />
        <MetalCard price={500} />
        
        <button
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#3f3f46",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "#575757", display: "inline-block"
            }}
          />
          SELECT STONE
          <span style={{ marginLeft: "auto" }}>›</span>
        </button>
      </aside>

      {/* CENTER + RIGHT placeholders  */}
      <section className={styles.center}>
        <div className={styles.placeholder}>Viewer area</div>
      </section>
      <aside className={styles.right}></aside>
    </main>
  );
}
