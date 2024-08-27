import cv2
import numpy as np
import sys
import json
from fingerprint_feature_extractor import extract_minutiae_features, MinutiaeFeature

class MinutiaeFeatureEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, MinutiaeFeature):
            return {
                "locX": int(obj.locX),  # Convertendo para tipo nativo
                "locY": int(obj.locY),  # Convertendo para tipo nativo
                "Orientation": [float(angle) for angle in obj.Orientation], # Convertendo para tipo nativo
                "Type": obj.Type
            }
        return super().default(obj)

def process_images(image_paths):
    all_minutiae = []

    for image_path in image_paths:
        # Ler a imagem
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

        # Pré-processamento
        blurred_img = cv2.GaussianBlur(img, (5, 5), 1.2)
        edges = cv2.Canny(blurred_img, 50, 150)

        # Extração de minúcias
        terminations, bifurcations = extract_minutiae_features(edges, spuriousMinutiaeThresh=10, invertImage=False, showResult=False, saveResult=False)
        features_as_dicts = feature_to_dict(terminations, bifurcations)
        all_minutiae.append(features_as_dicts)

    return all_minutiae

def feature_to_dict(terminations, bifurcations):
    # Unir as listas de terminations e bifurcations
    all_minutiae = terminations + bifurcations
    # Converter todos os itens da lista para dicionários
    return {
        "minutiaes": [MinutiaeFeatureEncoder().default(minutiae) for minutiae in all_minutiae]
    }

if __name__ == "__main__":
    # Passar caminhos de imagens
    image_paths = sys.argv[1:]
    minutiae = process_images(image_paths)
    print(json.dumps(minutiae, indent=4))
