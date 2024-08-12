import { IconProps, MicFill, Magic, Dice5, Dice5Fill, Snow, Pencil } from 'react-bootstrap-icons'
import { FunctionComponent } from 'react';

type IconType = {
  [key: string]: FunctionComponent<IconProps>
}

const iconNameMap: IconType = {
  Microphone: MicFill,
  Magicwand: Magic,
  Dice: Dice5Fill,
  Freeze: Snow,
  Draw: Pencil,
}

export function getIcon(name: string) {
  if (typeof iconNameMap[name] === 'undefined') {
    throw new Error(`Unknown icon requested ${name}`)
  }

  return iconNameMap[name]
}