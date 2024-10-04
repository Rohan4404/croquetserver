// // // import { PawnBehavior } from "../PrototypeBehavior";

// // // class LightPawn extends PawnBehavior {
// // //   setup() {
// // //     let trm = this.service("ThreeRenderManager");
// // //     let group = this.shape;
// // //     let THREE = Microverse.THREE;
// // //     let model;
// // //     if (this.actor._cardData.toneMappingExposure !== undefined) {
// // //       trm.renderer.toneMappingExposure =
// // //         this.actor._cardData.toneMappingExposure;
// // //     }

// // //     const dracoLoader = new THREE.DRACOLoader();
// // //     dracoLoader.setDecoderPath(
// // //       "https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/libs/draco/"
// // //     );

// // //     // Set DRACOLoader as an extension to GLTFLoader
// // //     const gltfLoader = new THREE.GLTFLoader();
// // //     gltfLoader.setDRACOLoader(dracoLoader);

// // //     this.lights = [];

// // //     const loadModelPromise = new Promise((resolve, reject) => {
// // //       gltfLoader.load(
// // //         "./assets/Change New.glb",
// // //         (gltf) => {
// // //           model = gltf.scene;

// // //           model.position.set(0, -1.6, 0);
// // //           const scaleFactor = 2;
// // //           model.scale.set(scaleFactor, scaleFactor, scaleFactor);

// // //           group.add(model);
// // //           console.log(model);

// // //           resolve(model);
// // //         },
// // //         null,
// // //         (error) => {
// // //           console.error("Error loading GLTF model:", error);
// // //           reject(error);
// // //         }
// // //       );
// // //     });

// // //     loadModelPromise
// // //       .then((model) => {})
// // //       .catch((error) => {
// // //         console.error("Error loading GLTF model:", error);
// // //       });
// // //   }

// // //   teardown() {
// // //     let scene = this.service("ThreeRenderManager").scene;

// // //     scene.background?.dispose();
// // //     scene.environment?.dispose();
// // //     scene.background = null;
// // //     scene.environment = null;

// // //     // Dispose particle system
// // //     if (this.particleSystem) {
// // //       this.shape.remove(this.particleSystem);
// // //       this.particleSystem.geometry.dispose();
// // //       this.particleSystem.material.dispose();
// // //     }
// // //   }
// // // }

// // // export default {
// // //   modules: [
// // //     {
// // //       name: "Audio",
// // //       pawnBehaviors: [LightPawn],
// // //     },
// // //   ],
// // // };

// // import { PawnBehavior } from "../PrototypeBehavior";

// // class LightPawn extends PawnBehavior {
// //   setup() {
// //     let trm = this.service("ThreeRenderManager");
// //     let group = this.shape;
// //     let THREE = Microverse.THREE;
// //     let model;

// //     if (this.actor._cardData.toneMappingExposure !== undefined) {
// //       trm.renderer.toneMappingExposure =
// //         this.actor._cardData.toneMappingExposure;
// //     }

// //     const dracoLoader = new THREE.DRACOLoader();
// //     dracoLoader.setDecoderPath(
// //       "https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/libs/draco/"
// //     );

// //     const gltfLoader = new THREE.GLTFLoader();
// //     gltfLoader.setDRACOLoader(dracoLoader);

// //     this.lights = [];

// //     const loadModelPromise = new Promise((resolve, reject) => {
// //       gltfLoader.load(
// //         "./assets/Change New.glb",
// //         (gltf) => {
// //           model = gltf.scene;

// //           model.position.set(0, -1.6, 0);
// //           const scaleFactor = 2;
// //           model.scale.set(scaleFactor, scaleFactor, scaleFactor);

// //           group.add(model);
// //           console.log(model);

// //           // Add click event listener to detect when a child is clicked
// //           this.addClickListenerToModel(model);

// //           resolve(model);
// //         },
// //         null,
// //         (error) => {
// //           console.error("Error loading GLTF model:", error);
// //           reject(error);
// //         }
// //       );
// //     });

// //     loadModelPromise
// //       .then((model) => {})
// //       .catch((error) => {
// //         console.error("Error loading GLTF model:", error);
// //       });
// //   }

// //   // Function to add click event listener to model's children
// //   addClickListenerToModel(model) {
// //     let trm = this.service("ThreeRenderManager");
// //     const raycaster = new Microverse.THREE.Raycaster();
// //     const mouse = new Microverse.THREE.Vector2();

// //     // Add event listener for click events
// //     window.addEventListener("click", (event) => {
// //       // Update the mouse variable
// //       mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
// //       mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

// //       // Use raycaster to detect intersection with model's children
// //       raycaster.setFromCamera(mouse, trm.camera);
// //       const intersects = raycaster.intersectObjects(model.children, true);

// //       if (intersects.length > 0) {
// //         // Get the clicked child object
// //         const clickedChild = intersects[0].object;

// //         // Send the name of the clicked child to the API
// //         this.storeClickedObjectName(clickedChild.name);
// //       }
// //     });
// //   }

// //   // Function to send the clicked child's name to the API
// //   async storeClickedObjectName(variable) {
// //     try {
// //       const response = await fetch(
// //         "https://termpvariable.vercel.app/store-data",
// //         {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({ variable }), // Use the variable parameter to store the name
// //         }
// //       );

// //       const result = await response.json();
// //       console.log("Stored object name in API:", result);
// //     } catch (error) {
// //       console.error("Error storing clicked object name in API:", error);
// //     }
// //   }

// //   teardown() {
// //     let scene = this.service("ThreeRenderManager").scene;

// //     scene.background?.dispose();
// //     scene.environment?.dispose();
// //     scene.background = null;
// //     scene.environment = null;

// //     // Dispose particle system
// //     if (this.particleSystem) {
// //       this.shape.remove(this.particleSystem);
// //       this.particleSystem.geometry.dispose();
// //       this.particleSystem.material.dispose();
// //     }
// //   }
// // }

// // export default {
// //   modules: [
// //     {
// //       name: "Audio",
// //       pawnBehaviors: [LightPawn],
// //     },
// //   ],
// // };
// import { PawnBehavior } from "../PrototypeBehavior";

// class LightPawn extends PawnBehavior {
//   setup() {
//     let trm = this.service("ThreeRenderManager");
//     let group = this.shape;
//     let THREE = Microverse.THREE;
//     let model;

//     if (this.actor._cardData.toneMappingExposure !== undefined) {
//       trm.renderer.toneMappingExposure =
//         this.actor._cardData.toneMappingExposure;
//     }

//     const dracoLoader = new THREE.DRACOLoader();
//     dracoLoader.setDecoderPath(
//       "https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/libs/draco/"
//     );

//     const gltfLoader = new THREE.GLTFLoader();
//     gltfLoader.setDRACOLoader(dracoLoader);

//     this.lights = [];

//     const loadModelPromise = new Promise((resolve, reject) => {
//       gltfLoader.load(
//         "./assets/Change New.glb",
//         (gltf) => {
//           model = gltf.scene;

//           model.position.set(0, -1.6, 0);
//           const scaleFactor = 2;
//           model.scale.set(scaleFactor, scaleFactor, scaleFactor);

//           group.add(model);
//           console.log(model);

//           // Add click event listener to detect when a child is clicked
//           this.addClickListenerToModel(model);

//           resolve(model);
//         },
//         null,
//         (error) => {
//           console.error("Error loading GLTF model:", error);
//           reject(error);
//         }
//       );
//     });

//     loadModelPromise
//       .then((model) => {})
//       .catch((error) => {
//         console.error("Error loading GLTF model:", error);
//       });
//   }

//   // Function to add click event listener to model's children
//   addClickListenerToModel(model) {
//     let trm = this.service("ThreeRenderManager");
//     const raycaster = new Microverse.THREE.Raycaster();
//     const mouse = new Microverse.THREE.Vector2();
//     const allowedObjects = new Set(); // Store allowed objects

//     // Define allowed children based on index ranges
//     model.children.forEach((child, index) => {
//       if ((index >= 0 && index <= 4) || (index >= 16 && index <= 70)) {
//         child.children.forEach((subchild, subIndex) => {
//           if (subIndex >= 1 && subIndex <= 12) {
//             allowedObjects.add(subchild);
//           }
//         });
//       }
//     });

//     model.children.forEach((child, index) => {
//       if ((index >= 0 && index <= 4) || (index >= 16 && index <= 70)) {
//         child.children.forEach((subchild, subIndex) => {
//           if (subIndex === 0) {
//             allowedObjects.add(subchild);
//           }
//         });
//       }
//     });

//     model.children.forEach((child, index) => {
//       if (index == 71 || index == 79) {
//         allowedObjects.add(child);
//       }
//     });

//     // Add event listener for click events
//     window.addEventListener("click", (event) => {
//       // Update the mouse variable
//       mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//       mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//       // Use raycaster to detect intersection with allowed objects
//       raycaster.setFromCamera(mouse, trm.camera);
//       const intersects = raycaster.intersectObjects(
//         Array.from(allowedObjects),
//         true
//       );

//       if (intersects.length > 0) {
//         // Get the clicked child object
//         const clickedChild = intersects[0].object;

//         // Send the name of the clicked child to the API
//         this.storeClickedObjectName(clickedChild.name);
//       }
//     });
//   }

//   // Function to send the clicked child's name to the API
//   async storeClickedObjectName(variable) {
//     try {
//       const response = await fetch(
//         "https://termpvariable.vercel.app/store-data",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ variable }), // Use the variable parameter to store the name
//         }
//       );

//       const result = await response.json();
//       console.log("Stored object name in API:", result);
//     } catch (error) {
//       console.error("Error storing clicked object name in API:", error);
//     }
//   }

//   teardown() {
//     let scene = this.service("ThreeRenderManager").scene;

//     scene.background?.dispose();
//     scene.environment?.dispose();
//     scene.background = null;
//     scene.environment = null;

//     // Dispose particle system
//     if (this.particleSystem) {
//       this.shape.remove(this.particleSystem);
//       this.particleSystem.geometry.dispose();
//       this.particleSystem.material.dispose();
//     }
//   }
// }

// export default {
//   modules: [
//     {
//       name: "Audio",
//       pawnBehaviors: [LightPawn],
//     },
//   ],
// };

import { PawnBehavior } from "../PrototypeBehavior";

class LightPawn extends PawnBehavior {
  setup() {
    let trm = this.service("ThreeRenderManager");
    let group = this.shape;
    let THREE = Microverse.THREE;
    let model;
    this.highlightedObject = null; // Track currently highlighted object

    if (this.actor._cardData.toneMappingExposure !== undefined) {
      trm.renderer.toneMappingExposure =
        this.actor._cardData.toneMappingExposure;
    }

    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/libs/draco/"
    );

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    this.lights = [];

    const loadModelPromise = new Promise((resolve, reject) => {
      gltfLoader.load(
        "./assets/Change New.glb",
        (gltf) => {
          model = gltf.scene;

          model.position.set(0, -1.6, 0);
          const scaleFactor = 2;
          model.scale.set(scaleFactor, scaleFactor, scaleFactor);

          group.add(model);
          console.log(model);

          // Add click event listener to detect when a child is clicked
          this.addClickListenerToModel(model);

          resolve(model);
        },
        null,
        (error) => {
          console.error("Error loading GLTF model:", error);
          reject(error);
        }
      );
    });

    loadModelPromise
      .then((model) => {})
      .catch((error) => {
        console.error("Error loading GLTF model:", error);
      });
  }

  // Function to add click event listener to model's children
  addClickListenerToModel(model) {
    let trm = this.service("ThreeRenderManager");
    const raycaster = new Microverse.THREE.Raycaster();
    const mouse = new Microverse.THREE.Vector2();
    const allowedObjects = new Set(); // Store allowed objects

    // Define allowed children based on index ranges
    model.children.forEach((child, index) => {
      if ((index >= 0 && index <= 4) || (index >= 16 && index <= 70)) {
        allowedObjects.add(child);
        child.children.forEach((subchild, subIndex) => {
          if (subIndex >= 2 && subIndex <= 13) {
            allowedObjects.add(subchild);
          }
        });
      }
    });

    // model.children.forEach((child, index) => {
    //   if ((index >= 0 && index <= 4) || (index >= 16 && index <= 70)) {
    //     child.children.forEach((subchild, subIndex) => {
    //       if (subIndex == 0) {
    //         allowedObjects.add(subchild);
    //       }
    //     });
    //   }
    // });

    model.children.forEach((child, index) => {
      if (index == 71 || index == 79) {
        allowedObjects.add(child);
      }
    });

    // Add event listener for click events
    window.addEventListener("click", (event) => {
      // Update the mouse variable
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Use raycaster to detect intersection with allowed objects
      raycaster.setFromCamera(mouse, trm.camera);
      const intersects = raycaster.intersectObjects(
        Array.from(allowedObjects),
        true
      );

      if (intersects.length > 0) {
        // Get the clicked child object
        const clickedChild = intersects[0].object;

        // Store and highlight the clicked object
        this.storeAndHighlightClickedObject(clickedChild);
      }
    });
  }

  // Function to store and highlight the clicked object
  async storeAndHighlightClickedObject(clickedChild) {
    // Unhighlight the previous object if one exists
    if (this.highlightedObject) {
      this.unhighlightObject(this.highlightedObject);
    }

    // Highlight the new clicked object
    this.highlightObject(clickedChild);

    // Update the currently highlighted object
    this.highlightedObject = clickedChild;

    // Send the name of the clicked child to the API
    await this.storeClickedObjectName(clickedChild.name);
  }

  // Function to highlight an object (e.g., change color)
  highlightObject(object) {
    object.originalColor = object.material.color.clone(); // Save original color
    object.material.color.set(0xffff00); // Highlight color (yellow)
  }

  // Function to unhighlight an object (restore original color)
  unhighlightObject(object) {
    if (object.originalColor) {
      object.material.color.copy(object.originalColor); // Restore original color
    }
  }

  // Function to send the clicked child's name to the API
  async storeClickedObjectName(variable) {
    try {
      const response = await fetch(
        "https://termpvariable.vercel.app/store-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variable }), // Use the variable parameter to store the name
        }
      );

      const result = await response.json();
      console.log("Stored object name in API:", result);
    } catch (error) {
      console.error("Error storing clicked object name in API:", error);
    }
  }

  teardown() {
    let scene = this.service("ThreeRenderManager").scene;

    scene.background?.dispose();
    scene.environment?.dispose();
    scene.background = null;
    scene.environment = null;

    // Dispose particle system
    if (this.particleSystem) {
      this.shape.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
    }
  }
}

export default {
  modules: [
    {
      name: "Audio",
      pawnBehaviors: [LightPawn],
    },
  ],
};
