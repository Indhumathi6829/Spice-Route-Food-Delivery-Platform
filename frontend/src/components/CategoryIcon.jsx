/**
 * CategoryIcon — maps category names to Lucide SVG icons.
 * No emoji, no Unicode corruption. Consistent stroke weight and size.
 */
import {
  Flame, Pizza, Beef, Soup, Utensils, IceCream, Coffee,
  Package, ChefHat, Globe, Leaf, Fish, Drumstick, Sandwich,
  Cookie, Apple, Droplets, Salad
} from 'lucide-react'

/** Map category name → { Icon, gradient classes } */
const CATEGORY_MAP = {
  'Biryani':       { Icon: Flame,     gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50',  text: 'text-amber-600'  },
  'Starters':      { Icon: Flame,     gradient: 'from-red-400 to-orange-400',   bg: 'bg-red-50',    text: 'text-red-600'    },
  'Main Course':   { Icon: Soup,      gradient: 'from-orange-400 to-amber-400', bg: 'bg-orange-50', text: 'text-orange-600' },
  'Pizza':         { Icon: Pizza,     gradient: 'from-yellow-400 to-orange-400',bg: 'bg-yellow-50', text: 'text-yellow-600' },
  'Burgers':       { Icon: Beef,      gradient: 'from-amber-400 to-yellow-500', bg: 'bg-amber-50',  text: 'text-amber-700'  },
  'Desserts':      { Icon: Cookie,    gradient: 'from-pink-300 to-purple-400',  bg: 'bg-pink-50',   text: 'text-pink-600'   },
  'Beverages':     { Icon: Coffee,    gradient: 'from-blue-300 to-cyan-400',    bg: 'bg-blue-50',   text: 'text-blue-600'   },
  'Combos':        { Icon: Package,   gradient: 'from-purple-400 to-pink-400',  bg: 'bg-purple-50', text: 'text-purple-600' },
  'Chinese':       { Icon: Soup,      gradient: 'from-red-400 to-pink-400',     bg: 'bg-red-50',    text: 'text-red-600'    },
  'Italian':       { Icon: Utensils,  gradient: 'from-green-400 to-teal-400',   bg: 'bg-green-50',  text: 'text-green-600'  },
  'Mexican':       { Icon: Salad,     gradient: 'from-lime-400 to-green-400',   bg: 'bg-lime-50',   text: 'text-lime-700'   },
  'Japanese':      { Icon: Fish,      gradient: 'from-pink-400 to-rose-400',    bg: 'bg-pink-50',   text: 'text-rose-600'   },
  'Korean':        { Icon: Drumstick, gradient: 'from-purple-400 to-indigo-400',bg: 'bg-purple-50', text: 'text-indigo-600' },
  'American':      { Icon: Beef,      gradient: 'from-red-300 to-red-500',      bg: 'bg-red-50',    text: 'text-red-600'    },
  'Middle Eastern':{ Icon: Sandwich,  gradient: 'from-teal-400 to-cyan-400',    bg: 'bg-teal-50',   text: 'text-teal-600'   },
  'South Indian':  { Icon: Utensils,  gradient: 'from-yellow-400 to-orange-400',bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'Snacks':        { Icon: Cookie,    gradient: 'from-yellow-300 to-amber-400', bg: 'bg-yellow-50', text: 'text-amber-600'  },
  'Juices':        { Icon: Droplets,  gradient: 'from-cyan-400 to-blue-400',    bg: 'bg-cyan-50',   text: 'text-cyan-600'   },
  'Ice Creams':    { Icon: IceCream,  gradient: 'from-sky-300 to-blue-400',     bg: 'bg-sky-50',    text: 'text-sky-600'    },
  'Indian':        { Icon: Flame,     gradient: 'from-orange-400 to-red-400',   bg: 'bg-orange-50', text: 'text-orange-600' },
}

const DEFAULT = { Icon: ChefHat, gradient: 'from-brand-400 to-brand-500', bg: 'bg-brand-50', text: 'text-brand-600' }

/**
 * @param {string} name - category name
 * @param {string} size - icon size class e.g. 'w-7 h-7'
 * @param {string} containerClass - extra classes on container
 * @param {'gradient'|'flat'} variant - gradient pill or flat bg
 */
export function CategoryIcon({ name, size = 'w-7 h-7', containerClass = '', variant = 'gradient' }) {
  const cfg = CATEGORY_MAP[name] || DEFAULT
  const { Icon, gradient, bg, text } = cfg

  if (variant === 'flat') {
    return (
      <div className={`${bg} rounded-2xl flex items-center justify-center ${containerClass}`}>
        <Icon className={`${size} ${text}`} strokeWidth={1.75} />
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-sm ${containerClass}`}>
      <Icon className={`${size} text-white`} strokeWidth={2} />
    </div>
  )
}

/** Returns just the Icon component and config for a category name */
export function getCategoryConfig(name) {
  return CATEGORY_MAP[name] || DEFAULT
}

export default CategoryIcon
