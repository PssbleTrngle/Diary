import React from 'react';
import { IService } from '../api/Models';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpotify, faInstagram, faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faUsers, IconDefinition, faQuestion } from '@fortawesome/free-solid-svg-icons';

interface IStyle {
    icon: IconDefinition;
    color: string;
    backgroundColor: string;
}

const Styles: { [key: string]: Partial<IStyle> | undefined } = {
    spotify: { icon: faSpotify, color: '#1db954' },
    instagram: { icon: faInstagram, color: '#e1306c' },
    facebook: { icon: faFacebook, color: '#3b5998' },
    github: { icon: faGithub, color: '#fafafa', backgroundColor: '#333' },
    contacts: { icon: faUsers, color: '#439fd3' },
}

const DEFAULT: IStyle = {
    icon: faQuestion,
    color: '#FFF',
    backgroundColor: '#000',
}

function getBrighness(color: string) {
    const [r1, r2, g1, g2, b1, b2] = color.split('');
    const [r, g, b] = [[r1, r2], [g1, g2], [b1, b2]]
        .map(a => a.join(''))
        .map(s => Number.parseInt(s, 16))
    return r + g + b;
}

export function getStyle(service: string): IStyle & { text: string } {
    const style: Partial<IStyle> = Styles[service.toLowerCase()] ?? {};
    style.backgroundColor = style.backgroundColor ?? style.color;
    const defaulted = { ...DEFAULT, ...style };

    const bright = getBrighness(defaulted.backgroundColor) > 384;
    const text = bright ? '#000' : '#FFF';

    return { ...defaulted, text };
}

export const ServiceIcon = ({ name, url }: IService & { url?: string }) => {
    const { icon, color } = getStyle(name);
    return <Icon href={url} target='_blank' title={name} className='service' {...{ icon, color }} />
}