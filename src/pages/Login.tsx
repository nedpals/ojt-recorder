// import { Navigate, useLocation } from 'react-router-dom';
// import { pb } from '@/pocketbase';
import { Button } from '@/components/ui/button';

export default function Login() {
    // const loc = useLocation();

    // if (pb.authStore.model) {
    //     return <Navigate to={loc.state?.from ?? '/'} />;
    // }

    return (
        <div>
            <h1>Login</h1>

            <Button>Login</Button>
        </div>
    );
}
