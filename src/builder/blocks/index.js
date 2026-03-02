import { TextBlock } from './TextBlock';
import { SectionHeader } from './SectionHeader';
import { GlassCard } from './GlassCard';
import { CardsGrid } from './CardsGrid';
import { InfoCard } from './InfoCard';
import { ImageBlock } from './ImageBlock';
import { ButtonGroup } from './ButtonGroup';
import { Spacer } from './Spacer';
import { Divider } from './Divider';
import { MetricCard } from './MetricCard';
import { YouTubeEmbed } from './YouTubeEmbed';
import { TagList } from './TagList';
import { Container } from './Container';

// Resolver map for Craft.js
export const resolvers = {
  TextBlock,
  SectionHeader,
  GlassCard,
  CardsGrid,
  InfoCard,
  ImageBlock,
  ButtonGroup,
  Spacer,
  Divider,
  MetricCard,
  YouTubeEmbed,
  TagList,
  Container,
};

// Palette metadata for the component palette
export const paletteItems = [
  { name: 'Container', component: Container, icon: 'Square', description: 'Generic container' },
  { name: 'TextBlock', component: TextBlock, icon: 'Type', description: 'Text paragraph' },
  { name: 'SectionHeader', component: SectionHeader, icon: 'Heading', description: 'Section heading with icon' },
  { name: 'GlassCard', component: GlassCard, icon: 'CreditCard', description: 'Glass morphism card' },
  { name: 'CardsGrid', component: CardsGrid, icon: 'LayoutGrid', description: 'Multi-column grid' },
  { name: 'InfoCard', component: InfoCard, icon: 'FileText', description: 'Info card with title/body' },
  { name: 'MetricCard', component: MetricCard, icon: 'BarChart3', description: 'KPI metric display' },
  { name: 'ImageBlock', component: ImageBlock, icon: 'Image', description: 'Image with controls' },
  { name: 'YouTubeEmbed', component: YouTubeEmbed, icon: 'Youtube', description: 'YouTube video embed' },
  { name: 'ButtonGroup', component: ButtonGroup, icon: 'MousePointerClick', description: 'CTA buttons' },
  { name: 'TagList', component: TagList, icon: 'Tags', description: 'Tag pill list' },
  { name: 'Spacer', component: Spacer, icon: 'ArrowUpDown', description: 'Vertical spacing' },
  { name: 'Divider', component: Divider, icon: 'Minus', description: 'Horizontal line' },
];

export {
  TextBlock,
  SectionHeader,
  GlassCard,
  CardsGrid,
  InfoCard,
  ImageBlock,
  ButtonGroup,
  Spacer,
  Divider,
  MetricCard,
  YouTubeEmbed,
  TagList,
  Container,
};
