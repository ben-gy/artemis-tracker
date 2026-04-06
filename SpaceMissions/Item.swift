//
//  Item.swift
//  SpaceMissions
//
//  Created by Ben Richardson on 6/4/2026.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
