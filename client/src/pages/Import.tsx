import React from 'react';
import { useLoadingList } from '../api/Hooks';
import { IService } from '../api/Models';
import API from '../api/Api';

const Import = () => {
    const services = useLoadingList<IService>('imports', services =>
        <>
            {services.map(s =>
                <li key={s.id}>
                    <Button {...s} />
                </li>
            )}
        </>
    );

    return <ul>{services}</ul>;
}

const Button = ({ id, name }: IService) => {

    const click = () => {
        API.post(`import/${id}`)
            .catch(e => console.error(e))
    }

    return <button onClick={click}>
        {name}
    </button>
}

export default Import;