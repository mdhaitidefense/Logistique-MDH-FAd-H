import React from 'react';
import { 
  Package, Shield, Truck, Zap, HardHat, Wrench, Radio, Cross, Briefcase, 
  Home, Activity, Cpu, FlaskConical, Gauge, Hammer, Key, LifeBuoy, 
  Lightbulb, Lock, Plane, Plug, Power, Rocket, Server, Target, 
  Thermometer, Wifi, Box, Construction, Stethoscope, Car, PlaneTakeoff, Anchor 
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'Package', icon: Package },
  { name: 'Shield', icon: Shield },
  { name: 'Truck', icon: Truck },
  { name: 'Zap', icon: Zap },
  { name: 'HardHat', icon: HardHat },
  { name: 'Wrench', icon: Wrench },
  { name: 'Radio', icon: Radio },
  { name: 'Cross', icon: Cross },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Home', icon: Home },
  { name: 'Activity', icon: Activity },
  { name: 'Cpu', icon: Cpu },
  { name: 'FlaskConical', icon: FlaskConical },
  { name: 'Gauge', icon: Gauge },
  { name: 'Hammer', icon: Hammer },
  { name: 'Key', icon: Key },
  { name: 'LifeBuoy', icon: LifeBuoy },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Lock', icon: Lock },
  { name: 'Plane', icon: Plane },
  { name: 'Plug', icon: Plug },
  { name: 'Power', icon: Power },
  { name: 'Rocket', icon: Rocket },
  { name: 'Server', icon: Server },
  { name: 'Target', icon: Target },
  { name: 'Thermometer', icon: Thermometer },
  { name: 'Wifi', icon: Wifi },
  { name: 'Box', icon: Box },
  { name: 'Construction', icon: Construction },
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'Car', icon: Car },
  { name: 'PlaneTakeoff', icon: PlaneTakeoff },
  { name: 'Anchor', icon: Anchor }
];

export const IconRenderer = ({ name, className }: { name?: string, className?: string }) => {
  const iconObj = AVAILABLE_ICONS.find(i => i.name === name) || AVAILABLE_ICONS[0];
  const IconComponent = iconObj.icon;
  return <IconComponent className={className} />;
};
