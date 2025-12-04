import React, { useState, useEffect } from 'react';
import './App.css';

// Initial packing items
const initialItems = [
  { id: 1, description: "Shirt", quantity: 5, packed: false },
  { id: 2, description: "Pants", quantity: 2, packed: false },
];

const uid = () => Math.random().toString(36).slice(2,9);

function Logo() {
  return <h1>My Travel List</h1>;
}

function Form({ onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');

  function submit(e) {
    e.preventDefault();

    if (!description.trim()) return;

    const newItem = {
      id: Date.now(),                
      description: description.trim(),
      quantity: Number(quantity),
      packed: false,
    };

    onAdd(newItem);

    setDescription('');
    setQuantity(1);
  }

  return (
    <form className="form" onSubmit={submit}>
      <input
        className="input-name"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. Toothbrush, Charger, Passport"
      />

      <input
        className="input-qty"
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button className="btn" type="submit">Add</button>
    </form>
  );
}

function Item({item, onToggle, onDelete}) {
  return (
    <div className="item" style={{ opacity: item.packed ? 0.7 : 1 }}>
      <div className="item-left">
        <input type="checkbox" checked={item.packed} onChange={() => onToggle(item.id)} />
        <div>
          <div className="itemText">{item.description} <span style={{color:'#2b6cb0'}}>x{item.quantity}</span></div>
          <div className="small-muted">{item.packed ? 'Packed' : 'Not packed'}</div>
        </div>
      </div>
      <div className="controls">
        <button onClick={() => onDelete(item.id)}>Delete</button>
      </div>
    </div>
  );
}

function PackingList({items, onToggle, onDelete, filter, sort}){
  
  let shown = items.filter(it => it.description.toLowerCase().includes(filter.toLowerCase()));

  if (sort === 'packed-first') shown = shown.sort((a,b) => (b.packed - a.packed));
  if (sort === 'unpacked-first') shown = shown.sort((a,b) => (a.packed - b.packed));

  if (shown.length === 0)
    return <div>No items found. Add items using the form above.</div>;

  return (
    <div className="list">
      {shown.map(it => (
        <Item key={it.id} item={it} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}

function Stats({items}){
  const total = items.length;
  const packed = items.filter(i => i.packed).length;
  const percent = total === 0 ? 0 : Math.round((packed/total)*100);


  return (
    <div className="stats">
      <div>
        <div className="stat-num">{total}</div>
        <div className="small-muted">Total</div>
      </div>
      <div>
        <div className="stat-num">{packed}</div>
        <div className="small-muted">Packed</div>
      </div>
      <div className="percent-box">{percent}% done</div>
    </div>
  );
}

function App() {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('my-travel-list');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.length > 0 ? parsed : initialItems;
      } else {
        return initialItems;
      }
    } catch (e) {
      return initialItems;
    }
  });

  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('none');

  useEffect(() => {
    localStorage.setItem('my-travel-list', JSON.stringify(items));
  }, [items]);

  function handleAdd(newItem) {
    setItems((prev) => [newItem, ...prev]);
  }

  function handleToggle(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, packed: !it.packed } : it)));
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleClearPacked() {
    setItems((prev) => prev.filter((it) => !it.packed));
  }

  return (
    <div className="app">
      <div className="header">
        <Logo />
      </div>

      <Form onAdd={handleAdd} />

      <div className="top-bar">
        <input
          className="search"
          placeholder="Search items..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="none">Sort: none</option>
          <option value="unpacked-first">Unpacked first</option>
          <option value="packed-first">Packed first</option>
        </select>

        <button onClick={() => setItems([])}>Clear all</button>
        <button onClick={handleClearPacked}>Remove packed</button>
      </div>

      <PackingList
        items={items}
        onToggle={handleToggle}
        onDelete={handleDelete}
        filter={filter}
        sort={sort}
      />

      <div className="footer">
        <Stats items={items} />
      </div>
    </div>
  );
}

export default App;