export type ShopCategory = 'snacks' | 'drinks' | 'meals'

export type ShopItem = {
  id: string
  name: string
  category: ShopCategory
  price: number
  image: string
}

export const shopCategories: { key: ShopCategory; label: string }[] = [
  { key: 'snacks', label: 'Snacks' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'meals', label: 'Meals' },
]

export const shopItems: ShopItem[] = [
  // ── Snacks ──
  { id: 'takoyaki', name: 'Takoyaki', category: 'snacks', price: 10, image: '/takoyaki.png' },
  { id: 'waffle', name: 'Waffle', category: 'snacks', price: 10, image: '/waffle.png' },
  { id: 'donut', name: 'Donut', category: 'snacks', price: 6, image: '/donut.png' },
  { id: 'bread', name: 'Bread', category: 'snacks', price: 2, image: '/bread.png' },
  { id: 'pan-de-sal', name: 'Pan de Sal', category: 'snacks', price: 2, image: '/pandesal.png' },
  { id: 'lumpia-tauge', name: 'Lumpia Tauge', category: 'snacks', price: 5, image: '/lumpia.png' },
  { id: 'turon', name: 'Turon', category: 'snacks', price: 5, image: '/turon.png' },
  { id: 'fries', name: 'Fries', category: 'snacks', price: 20, image: '/fries.png' },
  { id: 'green-piattos', name: 'Piattos', category: 'snacks', price: 5, image: '/piattos.png' },
  { id: 'vcut', name: 'Vcut', category: 'snacks', price: 7, image: '/VCUT.png' },
  { id: 'kuno-crunch', name: 'Kuno Crunch', category: 'snacks', price: 10, image: '/crunch.png' },
  { id: 'pringles', name: 'Pringles', category: 'snacks', price: 10, image: '/pringle.png' },
  { id: 'pizza', name: 'Pizza', category: 'snacks', price: 20, image: '/pizza.png' },
  { id: 'ice-cream', name: 'Ice Cream', category: 'snacks', price: 5, image: '/icecream.png' },
  { id: 'tub-ice-cream', name: 'Tub Ice Cream', category: 'snacks', price: 20, image: '/tubicecream.png' },
  { id: 'tempura', name: 'Tempura', category: 'snacks', price: 5, image: '/tempura.png' },
  { id: 'fishball', name: 'Fishball', category: 'snacks', price: 5, image: '/fishball.png' },
  { id: 'kwek-kwek', name: 'Kwek-kwek', category: 'snacks', price: 5, image: '/kwekkwek.png' },
  { id: 'yum-burger', name: 'Yum Burger', category: 'snacks', price: 10, image: '/yumburger.png' },
  { id: 'chicken-burger', name: 'Chicken Burger', category: 'snacks', price: 12, image: '/chikenburger.png' },
  { id: 'shawarma', name: 'Shawarma', category: 'snacks', price: 12, image: '/shawarma.png' },
  { id: 'isaw', name: 'Isaw', category: 'snacks', price: 2, image: '/isaw.png' },


  // ── Drinks ──
  { id: 'milk-tea', name: 'Milk Tea', category: 'drinks', price: 15, image: '/milktea.png' },
  { id: 'softdrinks', name: 'Softdrinks', category: 'drinks', price: 5, image: '/softdrinks.png' },
  { id: 'fruit-shake', name: 'Fruit Shake', category: 'drinks', price: 10, image: '/fruitshake.png' },
  { id: 'matcha', name: 'Matcha', category: 'drinks', price: 18, image: '/matcha.png' },
  { id: 'pocari', name: 'Pocari', category: 'drinks', price: 10, image: '/pocari.png' },
  { id: 'coke-float', name: 'Coke Float', category: 'drinks', price: 8, image: '/float.png' },

  // ── Meals ──
  { id: 'chicken', name: 'Chicken', category: 'meals', price: 7, image: '/chicken.png' },
  { id: 'chicken-joy', name: 'Chickenjoy', category: 'meals', price: 15, image: '/chickenjoy.png' },
  { id: 'burger-steak', name: 'Burger Steak', category: 'meals', price: 12, image: '/burgersteak.png' },
  { id: 'ultimate-burger-steak', name: 'Ultimate Burger Steak', category: 'meals', price: 20, image: '/supremesteak.png' },
  { id: 'mushroom-pepper-steak', name: 'Mushroom Pepper Steak', category: 'meals', price: 12, image: '/peppersteak.png' },
  { id: 'buwa', name: 'Buwa', category: 'meals', price: 25, image: '/buwa.png' },
  { id: 'chowking', name: 'Chowking', category: 'meals', price: 15, image: '/chowking.png' },
]
