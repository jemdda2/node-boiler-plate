import React, {useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action';

export default function (SpecificComponent, option, adminRoute = null) {

    // null => だれでも利用可能
    // true => Loginユーザーのみ、利用可能
    // false => Loginユーザーは利用不可

    function AuthenticationCheck(props) {
        const dispatch = useDispatch();

        useEffect(() => {

            dispatch(auth()).then(response => {
                console.log(response);

                // Loginしてない場合
                if (!response.payload.isAuth) {
                    if (option) {
                        props.history.push('/login')
                    }
                // Loginした場合
                } else {
                    if (adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    } else {
                        if (option === false) {
                            props.history.push('/')
                        }
                    }
                }
            })
        }, []);

        return (
            <SpecificComponent />
        )
    }
    return AuthenticationCheck
}