import express, { Express, Request, Response } from 'express';
import { connect, getStats, getUserFromPin, setHoursForDay } from './sheet';
import { getTime } from './util';

const app: Express = express();
const port = process.env.PORT || 3000;

connect();

app.use(express.static('./public'));

app.get('/login', async (req: Request, res: Response) => {
    try {
        const user = await getUserFromPin(<string>req.query.pin);
        if (user) {
            const now = getTime();
            if (user.get('loggedin') == 'TRUE') {
                user.set('logout', now.toISOString());
                const loggedin = new Date(user.get('login'));
                const hours = (now.getTime() - loggedin.getTime()) / 36e5;
                user.set('hours', hours);
                user.set('total', parseFloat(user.get('total')) + hours);
                user.set('loggedin', false);
                user.save();
                await setHoursForDay(<string>req.query.pin, hours);
                res.send({ msg: 'Logged out', pin: req.query.pin, name: `${user.get('fname')} ${user.get('lname')}`, hours: hours, total: user.get('total') });
            } else {
                user.set('login', now.toISOString());
                user.set('loggedin', true);
                user.save();
                res.send({ msg: 'Logged in', pin: req.query.pin, name: `${user.get('fname')} ${user.get('lname')}` });
            }
        } else {
            res.status(404).send({ msg: 'User not found' });
        }
    } catch (e: any) {
        res.status(500).send({ msg: e.message });
    }
});

app.get('/stats', async (req: Request, res: Response) => {
    res.send(await getStats());
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
