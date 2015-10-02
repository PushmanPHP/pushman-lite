# Pushman Lite

### Install
Create a table in your database.

    CREATE TABLE `channel_keys` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `key` varchar(255) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

These work as your channel keys, so you can run:

```php
$data = [
    'event' => 'secret-event',
    'data' => ['other' => data'],
];

\Redis::publish('admin-channel', json_encode($data));
```

And what NodeJS will do is lookup the key in your `channel_keys` event and append it to the channel name so end users can't guess your channel name.

I always use Laravel so you can write a quick helper function to get the channel key to pass into your view, even build an Eloquent model.

```php
// app/Pushman/ChannelKey.php

namespace App\Pushman;

class ChannelKey extends Eloquent {
    protected $table = 'channel_keys';
    public $timestamps = false;

    public static function key($channel_name) 
    {
        $model = self::where('name', $channel_name)->firstOrFail();
        return $model->key;
    }
}

// Then later define in helpers.php
function channelkey($channelName)
{
    return \App\Pushman\ChannelKey::key($channelName);
}
```

Then you can use it in your views:

```js
var socket = new io();

socket.on('{{ channelkey('admin') }}:admin:user-banned', function(data) {
    // do something
    console.log(data);
});
```
