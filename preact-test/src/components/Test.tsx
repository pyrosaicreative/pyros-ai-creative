import { useState } from "preact/hooks";

export default function Test() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>✅ Preact Works</h1>

      <p>Counter: {count}</p>

      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}