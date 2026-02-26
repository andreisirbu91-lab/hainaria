import React from 'react';
import HeroBlock from './HeroBlock';
import CategoryGridBlock from './CategoryGridBlock';
import FeaturedProductsBlock from './FeaturedProductsBlock';
import HowItWorksBlock from './HowItWorksBlock';
import NewsletterBlock from './NewsletterBlock';
import BannerBlock from './BannerBlock';

interface CmsBlock {
    id: string;
    type: string;
    content: any;
}

interface CmsBlockRendererProps {
    blocks: CmsBlock[];
}

export default function CmsBlockRenderer({ blocks }: CmsBlockRendererProps) {
    return (
        <div className="flex flex-col gap-0">
            {blocks.map((block) => {
                switch (block.type) {
                    case 'HERO':
                        return <HeroBlock key={block.id} content={block.content} />;
                    case 'CATEGORY_GRID':
                        return <CategoryGridBlock key={block.id} content={block.content} />;
                    case 'FEATURED_PRODUCTS':
                        return <FeaturedProductsBlock key={block.id} content={block.content} />;
                    case 'HOW_IT_WORKS':
                        return <HowItWorksBlock key={block.id} content={block.content} />;
                    case 'NEWSLETTER':
                        return <NewsletterBlock key={block.id} content={block.content} />;
                    case 'BANNER':
                        return <BannerBlock key={block.id} content={block.content} />;
                    default:
                        console.warn(`Unknown block type: ${block.type}`);
                        return null;
                }
            })}
        </div>
    );
}
