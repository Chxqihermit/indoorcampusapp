<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusBuilding extends Model
{
    protected $table = 'campusbuilding';

    protected $primaryKey = 'buildingID';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['buildingID', 'buildingName'];
}
