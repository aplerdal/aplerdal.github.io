+++
title = "Ticking Away"
date = 2026-08-30
description = "A deep dive into ticking in Mario Kart: Super Circuit"
+++

Ticking is a mechanic in both *Super Mario Kart* and *Mario Kart: Super Circuit* (MKSC) often used in time trials that allows us to maintain speed from a mushroom longer than usual and even drive through the offroad.
In either game, we can initiate the trick by mushrooming towards a wall or obstacle, hopping just before we hit it, and bouncing past whatever we hit. After we hit the wall, accelerating will cancel the ticking boost, so counterintuitively we must release accelerate to go faster. Here's a quick example:
![With ticking](/images/ticking.gif)

## How it works
The first important part of ticking is hitting the wall. You may be thinking "Don't we need to use a mushroom first?" While true, the mushroom boost isn't an important part of the trick. Technically we can start ticking off of a miniturbo, or even with no boost at all! Usually this isn't faster or relevant though, so I will start with the wall hit. Here is a slightly simplified version of the function that runs when a driver hits the wall. If the code isn't important to you don't worry about skipping it, I will explain everything that happens.
```c
void DriverCollision(Driver *driver)
{
    if ((driver->velocityX == 0) && (driver->velocityY == 0)) {
        // Driver isn't moving

        // Reset the kart
        ...
    } else {
        // Driver is moving

        // If the driver is moving backwards, this function doesn't do anything
        if (driver->velocity < 0) return;
        ...
        
        // Set the activeState and rotationState to WALL_BOUNCE
        driver->rotationState = ROT_STATE_WALL_BOUNCE
        driver->activeState = DRIVER_STATE_WALL_BOUNCE;
    }
    // Set the driver's overall velocity based on the X and Y velocity
    driver->velocity = math_hypot((int)driver->velocityX,(int)driver->velocityY) << 16; 
    return;
}
```
This function does two really important things for our situation. The first is that it sets the `activeState` and `rotationState` to `WALL_BOUNCE`. The other, which will come back up later, is setting our overall velocity based on the X and Y velocity. `velocity` and `velocityX ` and `velocityY` are *supposed* to stay in sync, but as you will see that isn't always the case.

For a rundown of the kart states, there are three important ones `activeState` is the state of the kart this frame. `rotationState` is used for handling drifing and rotating the character sprite. `driverState` is the overall state of the kart. You don't really need to understand the differences, but rather just that they are each different.

Anyhow, moving onto the next detail: maintaining the `WALL_BOUNCE` state. This is the most important part of ticking. I would argue that ticking is defined as driving in a `WALL_BOUNCE` state. There are a few ways the wall bounce state goes away after hitting a wall, but the main way is by our rotation state. Here is an overview of what happens in the `WALL_BOUNCE` rotation state
```c
switch (driver->rotationState) {
...
case ROT_STATE_WALL_BOUNCE:
    if ((driver->inputFlags & INPUT_FLG_ACCEL) != 0) {
        // Pressing gas (A)
        if (driver->velocity < (256 << 16)) {
            // Reset kart if speed is less than 256.0
            driver->driftAngle = 0;
        } else {
            // If speed is more than 256.0 reset the kart's angle
            StepAngleToZero(&driver->driftAngle)
            if (driver->driftAngle == 0) {
                // Once angle is zero go from WALL_BOUNCE back to NORMAL
                driver->rotationState = ROT_STATE_RECOVER;
                driver->activeState = DRIVER_STATE_NORMAL;
            }
        }
    } else {
        // Not pressing gas (A)
        if ((16 << 16) > driver->velocity) {
            // If velocity is less than 16.0 go from WALL_BOUNCE back to NORMAL
            driver->rotationState = ROT_STATE_RECOVER;
            driver->activeState = DRIVER_STATE_NORMAL;
        }
    }
    return;
...
}
```
This code is behind the reset back to `NORMAL`, which is what we are trying to avoid when ticking. When we are pressing A there are
a few possible outcomes. If our speed is less than 256, the kart will reset `driftAngle` to zero, resetting the activeState to `NORMAL` in another function (`DriverWallBounce`) that I have included later, but just know that it will reset to `NORMAL` for now. If our speed is more than 256, our kart will slowly rotate to the same spot as if our speed was slower, getting us to the same spot. Importantly, if we aren't pressing A, something different happens, and the state is only reset to `NORMAL` when our speed drops *below* 16. For a bit of reference on these speeds, most characters have a top speed around 2000, so these speed gates are near zero. Therefore, when we aren't pressing A, the mushroom boost is able to carry us without resetting the state back to `NORMAL`. Pretty neat!

The final key to getting ticking to work is hopping. Right when we hit a wall, even when hopping, our `velocityX` and `velocityY` are approximately halved, I won't show code for this, as it isn't super important and has a lot of details that aren't relevant to ticking. 
The important detail here is that our actual speed always is based on `velocity` and *not* `velocityX` and `velocityY`. They are usually just used to make the math a bit easier. This usally doesn't matter, but in some cases, like when we hop, it does. Here is a shortened version of the code that runs. Once again, I will explain it afterwards.
```c
switch (driver->driverState) {
    case DRIVER_STATE_NORMAL:
        // Only when *driverState* is NORMAL (driverState is different from activeState)
        if ((driver->statusFlag & DRIVER_STATUS_COLLISION) != 0) {
            // If we collided with something this frame, call DriverCollision
            DriverCollision(driver);
        }
    case DRIVER_STATE_AIRBORNE:
        // Apply gravity and some other stuff we don't really care about
        ...
        break;
    ...
}
```
This function is intended to call DriverCollision on the frame we hit something and call that important bit of code I mentioned earlier.
If you don't remember it, here it is:
```c
driver->velocity = math_hypot((int)driver->velocityX,(int)driver->velocityY) << 16;
```
This is the only place the game converts from `velocityX` and `velocityY` to `velocity`. Remember how I mentioned that only `velocityX` and `velocityY` were halved when we hit a wall? This is *supposed* to handle that. However, when we are airborne, the driverState isn't `NORMAL` and is instead `AIRBORNE`, so we never hit the DriverCollision function that is supposed to change `velocity`. This means that `velocityX` and `velocityY` get totally ignored, and eventually get set based on `velocity` instead of the other way around. In essence, throwing away the speed loss we should get for hitting a wall, and allowing us to carry all of our speed through the wall hit.

This is most of ticking, but there is one more important part, and that is the deceleration. This is a pretty simple one. The function that handles how much to decelerate the kart based on the surface is only called when `activeState` is `NORMAL`, as mentioned earlier, since we remained in the `WALL_BOUNCE` state, it never gets called. The only way we decelerate while ticking is via `DriverWallBounce`. Here is that function:
```c
int SpeedLossByAngle[] = { -4, -8, -16, -24, -36, -56, -64, -85 };

void DriverWallBounce(Driver *driver)
{
    int driftAngle;

    if (driver->rotationState == ROT_STATE_WALL_BOUNCE) {
        // In a wall bounce

        driftAngle = (int)driver->driftAngle;
        // When the drift angle is 0, activeState becomes NORMAL
        if (driftAngle != 0) {
            // Get the absolute value of diftAngle
            driftAngle = abs(driftAngle) / 2048; // 65536 is a full rotation
            
            // Limit angle to 7
            if (driftAngle > 7) {
                driftAngle = 7;
            }

            // Set acceleration negative (deceleration) based on the angle of the kart
            driver->acceleration = SpeedLossByAngle[driftAngle] << 16;

            // Exit, don't reset to NORMAL
            return;
        }
        driver->rotationState = ROT_STATE_RECOVER;
    }
    driver->activeState = DRIVER_STATE_NORMAL;
    return;
}
```
The key detail here is the `driver->acceleration =` portion, this sets our deceleration while ticking, which is based on the `driftAngle` of our kart based on the `SpeedLossByAnlge` table. You can also see that when the `driftAngle` is zero the kart will reset itself to `NORMAL` as mentioned earlier.

## Conclusion
That makes everything I have learned about ticking based on the code of the game. Lots of my examples here have omissions and simplifications to single out ticking, but all of the concepts should be completely accurate.

Thanks for reading this, and if you have any questions feel free to reach out!
