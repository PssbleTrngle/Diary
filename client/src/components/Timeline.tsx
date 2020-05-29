import React, { memo } from 'react';
import { useLoadingList } from '../api/Hooks';
import { IEntry } from '../api/Models';
import { useFormat } from './Settings';
import { ServiceIcon } from './Service';

const Timeline = memo(() => {

    const entries = useLoadingList<IEntry>('entries', e =>
        <div className='timeline'>{
            e.length > 0
                ? e.map(e => <Entry key={e.id} {...e} />)
                : <Empty />
        }</div>
    );

    return entries;
});

const Entry = ({ id, text, title, images, timestamps, service }: IEntry) => {
    const created = useFormat(timestamps.created);

    return <div className='entry'>
        {service && <ServiceIcon {...service} />}
        <span className='timestamp'>{created}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {images?.map((src, i) => <img key={i} {...{ src }} />)}
    </div>
}

const Empty = () => {
    return <p className='empty-info'>No entries yet</p>
}

export default Timeline;