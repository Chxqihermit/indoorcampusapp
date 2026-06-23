<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampusBuilding extends Model
{
    protected $table = 'campusbuilding';

    protected $primaryKey = 'buildingID';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['buildingID', 'buildingName'];

    public function floors(): HasMany
    {
        return $this->hasMany(Floor::class, 'buildingID', 'buildingID');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(StaffDirectory::class, 'buildingID', 'buildingID');
    }
}
